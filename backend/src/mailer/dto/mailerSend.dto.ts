import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, Length, ValidateNested } from "class-validator";

class PromotionDto {
    @ApiProperty({ description: "Promotion ID", type: String })
    @IsString()
    id: string;
  
    @ApiProperty({ description: "Promotion code", type: String })
    @IsString()
    code: string;
  
    @ApiProperty({ description: "Promotion name", type: String })
    @IsString()
    name: string;
  
    @ApiProperty({ description: "Promotion price", type: Number })
    @IsNumber()
    price: number;
  
    @ApiProperty({ description: "Type of price", type: String })
    @IsString()
    type_price: string;
  }
  
class OrderDto {
    @ApiProperty({ description: "Order ID", type: String })
    @IsString()
    _id: string;
  
    @ApiProperty({ description: "User ID", type: String })
    @IsString()
    uid: string;
  
    @ApiProperty({ description: "Event ID", type: String })
    @IsString()
    event_id: string;
  
    @ApiProperty({ description: "Showtimes ID", type: String })
    @IsString()
    showtimes_id: string;
  
    @ApiProperty({ description: "Order code", type: String })
    @IsString()
    code: string;
  
    @ApiProperty({ description: "Promotion details", type: () => PromotionDto, required: false })
    @Type(() => PromotionDto) 
    @ValidateNested({ each: true })
    @IsOptional()
    promotion?: PromotionDto;
  
    @ApiProperty({ description: "Total price", type: Number })
    @IsNumber()
    total_price: number;
  
    @ApiProperty({ description: "Order status", type: String })
    @IsString()
    status: string;
  }

export class MailerSendDTO{
    @Length(3, 100)
    @ApiProperty({
        description: 'to',
        type: String,
        example:'text@gmail.com'
    })
    @IsEmail()
    to: string;


    @ApiProperty({ description: "order info", type: () => OrderDto})
    @Type(() => OrderDto) 
    @ValidateNested({ each: true })
    order: OrderDto;

    @Length(3, 100)
    @ApiProperty({
        description: 'Subject',
        type: String,
    })
    @IsString()
    victim: string;

     
    @ApiProperty({
        description: 'text',
        type: String,
    })
    @IsString()
    link: string;
}
