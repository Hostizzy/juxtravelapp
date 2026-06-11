export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: 
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    anonKey: 
      process.env.SUPABASE_ANON_KEY ?? '',
  },
  meta: {
    accessToken: 
      process.env.META_ACCESS_TOKEN ?? '',
    phoneNumberId: 
      process.env.META_PHONE_NUMBER_ID ?? '',
    templateName: 
      process.env.META_WHATSAPP_TEMPLATE_NAME 
      ?? 'juxtravel_otp',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
  },
  surepass: {
    apiKey: process.env.SUREPASS_API_KEY ?? '',
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID ?? '',
    appSecret: process.env.INSTAGRAM_APP_SECRET ?? '',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI ?? '',
  },
});
