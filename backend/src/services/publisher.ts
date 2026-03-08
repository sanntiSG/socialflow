import axios from 'axios';
import Post, { IPost } from '../models/Post';
import User from '../models/User';
import { deleteFromCloudinary } from '../utils/cloudinary';

export const publishPost = async (postId: string, userId: string): Promise<void> => {
  const post = await Post.findById(postId);
  const user = await User.findById(userId);
  if (!post || !user) return;

  post.status = 'publishing';
  await post.save();

  let allSuccess = true;

  for (let i = 0; i < post.networks.length; i++) {
    const networkPost = post.networks[i];
    const connectedNetwork = user.connectedNetworks.find(n => n.network === networkPost.network);

    if (!connectedNetwork) {
      networkPost.status = 'failed';
      networkPost.error = 'Red social no conectada';
      allSuccess = false;
      continue;
    }

    try {
      console.log(`[Publisher] Iniciando subida a ${networkPost.network}...`);
      await publishToNetwork(networkPost.network, {
        accessToken: connectedNetwork.accessToken,
        refreshToken: connectedNetwork.refreshToken,
        userId: connectedNetwork.userId,
        text: networkPost.text,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        privacy: networkPost.privacy,
        extraOptions: networkPost.extraOptions,
      });

      console.log(`[Publisher] Éxito en ${networkPost.network}`);
      networkPost.status = 'published';
      networkPost.publishedAt = new Date();
    } catch (error: any) {
      console.error(`[Publisher] Error en ${networkPost.network}:`, error.message);
      networkPost.status = 'failed';
      networkPost.error = error.message;
      allSuccess = false;
    }
  }

  post.status = allSuccess ? 'published' : 'failed';

  // Delete from Cloudinary if all published
  if (post.mediaPublicId && allSuccess) {
    await deleteFromCloudinary(post.mediaPublicId, post.mediaType === 'video' ? 'video' : 'image');
    post.mediaPublicId = undefined;
  }

  await post.save();
};

const publishToNetwork = async (network: string, options: {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  mediaType: string;
  privacy: string;
  extraOptions?: Record<string, any>;
}) => {
  switch (network) {
    case 'facebook':
      return publishToFacebook(options);
    case 'instagram':
      return publishToInstagram(options);
    case 'tiktok':
      return publishToTikTok(options);
    case 'youtube':
      return publishToYouTube(options);
    default:
      throw new Error(`Red social ${network} no implementada`);
  }
};

const publishToFacebook = async (opts: any) => {
  const endpoint = opts.mediaUrl
    ? `https://graph.facebook.com/v18.0/${opts.userId}/photos`
    : `https://graph.facebook.com/v18.0/${opts.userId}/feed`;

  const params: any = { access_token: opts.accessToken, message: opts.text };
  if (opts.mediaUrl && opts.mediaType === 'image') params.url = opts.mediaUrl;

  const response = await axios.post(endpoint, params);
  return response.data;
};

const publishToInstagram = async (opts: any) => {
  console.log(`[Instagram] Publicando ${opts.mediaType} en @${opts.userId}`);

  const isVideo = opts.mediaType === 'video';
  const postType = opts.extraOptions?.postType || 'auto';
  const isReel = postType === 'reel' || (postType === 'auto' && isVideo);

  // Paso 1: Crear el contenedor del medio
  const mediaEndpoint = `https://graph.facebook.com/v18.0/${opts.userId}/media`;
  const mediaParams: any = {
    access_token: opts.accessToken,
    caption: opts.text,
  };

  if (isVideo) {
    mediaParams.video_url = opts.mediaUrl;
    mediaParams.media_type = 'REELS'; // Reels es el formato estándar ahora para videos
  } else {
    mediaParams.image_url = opts.mediaUrl;
  }

  try {
    console.log(`[Instagram] Creando contenedor...`);
    const containerResponse = await axios.post(mediaEndpoint, mediaParams);
    const creationId = containerResponse.data.id;
    console.log(`[Instagram] Contenedor creado: ${creationId}`);

    // Paso 2: Para videos/Reels, debemos esperar a que se procese
    if (isVideo) {
      let status = 'IN_PROGRESS';
      let attempts = 0;
      while (status !== 'FINISHED' && attempts < 15) {
        console.log(`[Instagram] Verificando estado del contenedor (intento ${attempts + 1})...`);
        const statusRes = await axios.get(`https://graph.facebook.com/v18.0/${creationId}`, {
          params: { fields: 'status_code', access_token: opts.accessToken }
        });
        status = statusRes.data.status_code;
        console.log(`[Instagram] Estado: ${status}`);
        if (status === 'FINISHED') break;
        if (status === 'ERROR') throw new Error('Error al procesar el video en Instagram');

        await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10s entre intentos
        attempts++;
      }
      if (status !== 'FINISHED') throw new Error('Timeout procesando video en Instagram');
    }

    // Paso 3: Publicar el contenedor
    console.log(`[Instagram] Publicando medio...`);
    const publishRes = await axios.post(
      `https://graph.facebook.com/v18.0/${opts.userId}/media_publish`,
      { access_token: opts.accessToken, creation_id: creationId }
    );

    return publishRes.data;
  } catch (err: any) {
    if (err.response) {
      console.error('[Instagram Error Details]:', JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
};

const publishToTikTok = async (opts: any) => {
  console.log(`[TikTok] Publicando video...`);
  const response = await axios.post(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    {
      post_info: { title: opts.text, privacy_level: opts.privacy === 'public' ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY' },
      source_info: { source: 'PULL_FROM_URL', video_url: opts.mediaUrl },
    },
    { headers: { Authorization: `Bearer ${opts.accessToken}` } }
  );
  return response.data;
};

const publishToYouTube = async (opts: any) => {
  const { google } = require('googleapis');
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: opts.accessToken,
    refresh_token: opts.refreshToken
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Determinar si es un Short basado en opciones o dimensiones (si tuviéramos las dimensiones aquí)
  // Por ahora confiamos en extraOptions.postType
  const postType = opts.extraOptions?.postType || 'auto';
  let title = opts.text ? opts.text.substring(0, 100) : 'Nuevo video de SocialFlow';

  if (postType === 'short' || (postType === 'auto' && title.toLowerCase().includes('#shorts'))) {
    if (!title.toLowerCase().includes('#shorts')) {
      title = `${title} #Shorts`;
    }
  }

  console.log(`[YouTube] Descargando video de ${opts.mediaUrl}...`);
  const response = await axios({
    method: 'GET',
    url: opts.mediaUrl,
    responseType: 'stream',
  });

  console.log(`[YouTube] Iniciando inserción de video (${postType})...`);
  const uploadRes = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title,
        description: opts.text,
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: opts.privacy === 'unlisted' ? 'unlisted' : 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: response.data,
    },
  });

  console.log(`[YouTube] Video subido: ${uploadRes.data.id}`);
  return uploadRes.data;
};
