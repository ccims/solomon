import { Module } from '@nestjs/common';
import OSLOParserSerivce from './oslo-parser.service';

@Module({
    providers: [OSLOParserSerivce],
    exports: [OSLOParserSerivce]
})
export class OSLOParserModule {}