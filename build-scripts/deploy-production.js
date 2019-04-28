var child_process = require('child_process');

const bucketName = 'my_bucket_name';
const distributionId = 'my_cloudfront_distributionId';
const buildFolder = 'project_build_folder_ending_with_slash/';

/*Build your web app -- Command to build web app*/
const buildWebAppCommand = `ng build --prod --configuration=production --aot --vendor-chunk --build-optimizer`;
/*upload files to the bucket with cache headers*/
const s3UploadCommand = `aws s3 sync --delete  ${buildFolder} s3://${bucketName}  --acl public-read --cache-control max-age=86400000,public`;
/*remove cache header of html files*/
const s3AddHeadersCommand = `aws s3 cp s3://${bucketName} s3://${bucketName} --recursive --exclude \"*\" --include \"*.html\" --metadata-directive REPLACE --acl public-read --cache-control max-age=0,must-revalidate,public --content-type \"text/html; charset=utf-8\"`;
/*Send cloudfornt InvalidationRequest to purge edge caches*/
const cloudfrontInvalidationRequest = `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths \"/*\"`;

function deploy() {
  console.log('Starting Deploy .');
  try {
    console.log('Starting Building App');
    child_process.execSync(buildWebAppCommand);
    console.log('App Build Finished');
    console.log('Starting Upload Files');
    child_process.execSync(s3UploadCommand);
    console.log('Files Upload Finished');
    console.log('Start Add Cloudfront Headers');
    child_process.execSync(s3AddHeadersCommand);
    console.log('Cloudfront Headers Finished');
    console.log('Starting Cloudfront invalidation request');
    child_process.execSync(cloudfrontInvalidationRequest);
    console.log('Invalidation Request Finished');
    console.log('::::::DEPLOY FINISHED::::::');
  } catch (error) {
    console.log(error);
    throw error;
  }
}

deploy();
