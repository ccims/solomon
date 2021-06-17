import { Module } from "@nestjs/common";
import { GropiusManager } from "./gropius-manager.service";

@Module({
    imports: [],
    providers: [GropiusManager],
    exports: [GropiusManager]
})
export class GropiusModule {}