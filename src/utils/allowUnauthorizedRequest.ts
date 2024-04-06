import { All, SetMetadata } from "@nestjs/common";

export const AllowUnauthorizedRequest = () => SetMetadata('allowUnauthorizedRequest', true);
