import { IsInt, Min, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  /** Product label shown to the buyer */
  @IsString()
  product: string;

  /** Amount in the smallest currency unit (cents, kopecks) */
  @IsInt()
  @Min(1)
  amount: number;
}
