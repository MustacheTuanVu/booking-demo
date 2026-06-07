import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsString } from "class-validator";

export class GuestDto {
    @ApiProperty({
      description: 'Phone',
      type: String,
      required: true,
    })
    @IsString()
    phone: string;

    @ApiProperty({
      description: 'is guest',
      type: Boolean,
      required: true,
    })
    @IsBoolean()
    is_guest: boolean;
  
    @ApiProperty({
      description: 'expiry',
      type: Date,
      required: true,
    })
    @IsDate()
    expiry: Date;
}

export class UpdateGuestsDto {
  @ApiProperty({ type: [GuestDto] }) 
  @IsArray() 
  guests: GuestDto[];
}
