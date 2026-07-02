import { Global, Module } from '@nestjs/common';
import { SearchService } from './search.service';

// @Global() so ListingsService and ProfilesService can inject SearchService
// without each module needing to import SearchModule explicitly.
@Global()
@Module({
  providers: [SearchService],
  exports:   [SearchService],
})
export class SearchModule {}
