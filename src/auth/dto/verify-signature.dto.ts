
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStellarPublicKey } from '../../common/decorators/is-stellar-address.decorator';

export class VerifySignatureDto {
    @IsStellarPublicKey({ message: 'publicKey must be a valid Stellar public key (56-char G... address)' })
    @IsNotEmpty()
    publicKey!: string;

    @IsNotEmpty()
    @IsString()
    signature!: string;

    @IsNotEmpty()
    @IsString()
    message!: string;
}
