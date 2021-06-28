import { Module } from '@nestjs/common';
import { XmlConverterService } from './xml-converter.service';

@Module({
    providers: [XmlConverterService],
    exports: [XmlConverterService]
})
export class XmlConverterModule {}
