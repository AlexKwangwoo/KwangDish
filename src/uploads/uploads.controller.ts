import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'kwangeatsproject';

//여기는 nest upload부분을 가져온것임!!
//컨트롤러 이름이 localhost~~/uploads 끝이 될것임!~
@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    try {
      //20.3강에서 설명
      //버킷이름은 소문자만 해야함!
      // const upload = await new AWS.S3()
      //   .createBucket({
      //     Bucket: 'kwangeatsproject',
      //   })
      //   .promise();
      // console.log('uploadupload', upload);
      // console.log('filefilefile', file);
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      // {url} 로 리턴해서 제이슨으로 보냈음!
      return { url };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
