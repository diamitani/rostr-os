import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-2";

const s3Client = new S3Client({ region: REGION });
const BUCKET = process.env.S3_BUCKET || "rostr-os-storage";

export { s3Client, BUCKET };
