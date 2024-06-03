import { FileManagerService } from '@/file-manager/file-manager.service';
import { databaseFile } from '@/../constant';
import { join } from 'path';
import { DataSource } from 'typeorm';

export const sqliteDatabaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [FileManagerService],
    useFactory: async (fileManagerService: FileManagerService) => {
      const dataFolderPath = await fileManagerService.getDataFolderPath();
      const sqlitePath = join(dataFolderPath, databaseFile);
      const dataSource = new DataSource({
        type: 'sqlite',
        database: sqlitePath,
        synchronize: process.env.NODE_ENV !== 'production',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });

      return dataSource.initialize();
    },
  },
];
