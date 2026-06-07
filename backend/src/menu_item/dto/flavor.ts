import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Flavor {
    @ApiProperty({ description: "Flavor name", type: String })
    @IsString()
    name: string;

    @ApiProperty({ description: "Flavor description", type: String })
    @IsString()
    description: string;

    @ApiProperty({ description: "Flavor icon", type: String })
    @IsString()
    icon: string;

    @ApiProperty({ description: "Flavor color", type: String })
    @IsString()
    color: string;
}
