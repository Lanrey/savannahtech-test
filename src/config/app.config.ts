import { getEnv } from './env.config';

const appConfig = {
  app: {
    name: process.env.APP_NAME,
    url: process.env.APP_URL,
    env: getEnv(),
  },
  server: {
    port: Number(process.env.PORT),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  pubSub: {
    secret: process.env.GOOGLE_PUBSUB_SECRET,
  },
  bullMq: {
    upgradeTierQueueName: String(process.env.UPGRADE_TIER_QUEUE),
    upgradeTierDelay: Number(process.env.UPGRADE_TIER_JOB_DELAY),
    upgrateTierJobName: String(process.env.UPGRADE_TIER_JOB_NAME),
  },
  firebase: {
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    },
    events: {
      createUser: String(process.env.FIREBASE_EVENT_CREATE_USER),
      updateUser: String(process.env.FIREBASE_EVENT_UPDATE_USER),
      deviceBinding: String(process.env.FIREBASE_EVENT_DEVICE_BINDING),
    },
  },
  emailsExemptedFromDeviceIdCheck: String(process.env.EMAILS_EXEMPTED_FROM_DEVICE_ID_CHECK),
  storage: {
    projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
    bucketName: process.env.GOOGLE_STORAGE_BUCKET_NAME,
    profilePictureBucketName: process.env.PROFILE_PICTURE_BUCKET_NAME,
  },
  queue: {
    processLivenessCheckQueueName: 'user:metamap-process-liveness-data-queue',
    processLivenessCheckJobName: 'user:process-liveness-data',
    retryLivenessCheckProcessingCount: 10,
    retryLivenessCheckProcessingInterval: '30s',
    processLivenessCheckFailedJobRetentionDurationInSeconds: 432000, // 5 days
  },
  metamap: {
    baseUrl: process.env.METAMAP_BASEURL,
    clientId: process.env.METAMAP_CLIENT_ID,
    clientSecret: process.env.METAMAP_CLIENT_SECRET,
    authVerificationFlowId: process.env.METAMAP_AUTH_VERIFICATION_FLOW_ID,
  },
  corebanking: {
    accountOfficerId: process.env.COREBANKING_ACCOUNT_OFFICER_ID,
    accountDomicileBranch: process.env.COREBANKING_ACCOUNT_DOMICILE_BRANCH,
    savingsAccountProductType: process.env.COREBANKING_SAVINGS_ACCOUNT_PRODUCT_TYPE,
  },
  services: {
    verification: {
      host: String(process.env.VERIFICATION_SERVICE_HOST),
      grpcHost: String(process.env.VERIFICATION_SERVICE_GRPC_HOST),
    },
    identity: {
      host: String(process.env.IDENTITY_SERVICE_HOST),
      grpcHost: String(process.env.IDENTITY_SERVICE_GRPC_HOST),
    },
    kyc: {
      host: process.env.KYC_SERVICE_HOST,
    },
    customer: {
      host: process.env.CUSTOMER_SERVICE_HOST,
    },
    account: {
      host: process.env.ACCOUNT_SERVICE_HOST,
    },
  },
  azureService: {
    logs: {
      connectionString: String(process.env.APPLICATION_INSIGHTS),
    },
    pubSub: {
      connectionString: String(process.env.PUB_SUB),
    },
  },
  github: {
    host: process.env.BASE_URL_GUTHUB,
    token: process.env.GITHUB_TOKEN,
  },
};

export default appConfig;

