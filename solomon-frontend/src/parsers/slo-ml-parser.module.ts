import { Module } from '@nestjs/common';
import SLOmlParserSerivce from './slo-ml-parser.service';

@Module({
    providers: [SLOmlParserSerivce],
    exports: [SLOmlParserSerivce]
})
export class SLOmlParserModule {}