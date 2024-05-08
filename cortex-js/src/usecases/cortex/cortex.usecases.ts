import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { CortexOperationSuccessfullyDto } from 'src/infrastructure/dtos/cortex/cortex-operation-successfully.dto';

@Injectable()
export class CortexUsecases {
  private cortexProcess: ChildProcess | undefined;

  constructor(private readonly configService: ConfigService) {}

  async startCortex(
    host: string,
    port: string,
  ): Promise<CortexOperationSuccessfullyDto> {
    if (this.cortexProcess) {
      return {
        message: 'Cortex is already running',
        status: 'success',
      };
    }

    const binaryPath = this.configService.get<string>('CORTEX_BINARY_PATH');
    if (!binaryPath || !existsSync(binaryPath)) {
      throw new InternalServerErrorException('Cortex binary not found');
    }

    const args: string[] = ['1', host, port];
    // go up one level to get the binary folder, have to also work on windows
    const binaryFolder = join(binaryPath, '..');

    this.cortexProcess = spawn(binaryPath, args, {
      detached: false,
      cwd: binaryFolder,
      env: {
        ...process.env,
        // TODO: NamH need to get below information
        // CUDA_VISIBLE_DEVICES: executableOptions.cudaVisibleDevices,
        // // Vulkan - Support 1 device at a time for now
        // ...(executableOptions.vkVisibleDevices?.length > 0 && {
        //   GGML_VULKAN_DEVICE: executableOptions.vkVisibleDevices[0],
        // }),
      },
    });

    this.pipeStdout();
    this.registerCortexEvents();

    return {
      message: 'Cortex started successfully',
      status: 'success',
    };
  }

  async stopCortex(): Promise<CortexOperationSuccessfullyDto> {
    if (!this.cortexProcess) {
      return {
        message: 'Cortex is not running',
        status: 'success',
      };
    }

    this.cortexProcess.kill();
    return {
      message: 'Cortex stopped successfully',
      status: 'success',
    };
  }

  private pipeStdout() {
    this.cortexProcess?.stdout?.on('data', (data) => {
      console.log('Cortex stdout', data);
    });

    this.cortexProcess?.stderr?.on('data', (data) => {
      console.error('Cortex stderr', data);
    });
  }

  private registerCortexEvents() {
    this.cortexProcess?.on('spawn', () => {});

    this.cortexProcess?.on('message', (message) => {
      console.log('Cortex process message', message);
    });

    this.cortexProcess?.on('close', (code, signal) => {
      console.log('Cortex process closed', code, signal);
      console.debug('Cleaning up..');
      this.unregisterCortexEvent();
      this.cortexProcess = undefined;
    });

    this.cortexProcess?.on('error', (err: Error) => {
      console.log('Cortex process error', err);
    });

    this.cortexProcess?.on('exit', (code, signal) => {
      console.log('Cortex process exited', code, signal);
    });
  }

  private unregisterCortexEvent() {
    this.cortexProcess?.removeAllListeners();
  }
}
