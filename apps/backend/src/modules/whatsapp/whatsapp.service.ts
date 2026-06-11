import { 
  Injectable, 
  Logger,
  InternalServerErrorException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(
    WhatsappService.name
  );

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async sendOTP(
    phoneNumber: string, 
    otp: string
  ): Promise<boolean> {
    const accessToken = 
      this.configService.get<string>(
        'meta.accessToken'
      );
    const phoneNumberId = 
      this.configService.get<string>(
        'meta.phoneNumberId'
      );
    const templateName = 
      this.configService.get<string>(
        'meta.templateName'
      );

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: otp },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              { type: 'text', text: otp },
            ],
          },
        ],
      },
    };

    try {
      await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
      
      this.logger.log(
        `OTP sent to ${phoneNumber}`
      );
      return true;
    } catch (error) {
      this.logger.error(
        'WhatsApp OTP send failed', error
      );
      throw new InternalServerErrorException(
        'Failed to send OTP'
      );
    }
  }
}
