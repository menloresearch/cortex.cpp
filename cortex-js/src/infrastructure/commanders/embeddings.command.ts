import {
  CommandRunner,
  InquirerService,
  Option,
  SubCommand,
} from 'nest-commander';
import { ModelsUsecases } from '@/usecases/models/models.usecases';
import { PSCliUsecases } from './usecases/ps.cli.usecases';
import { ChatCliUsecases } from './usecases/chat.cli.usecases';
import { inspect } from 'util';
import { ModelStat } from './types/model-stat.interface';

interface EmbeddingCommandOptions {
  encoding_format?: string;
  input?: string;
  dimensions?: number;
}

@SubCommand({
  name: 'embeddings',
  description: 'Creates an embedding vector representing the input text.',
})
export class EmbeddingCommand extends CommandRunner {
  constructor(
    private readonly chatCliUsecases: ChatCliUsecases,
    private readonly modelsUsecases: ModelsUsecases,
    private readonly psCliUsecases: PSCliUsecases,
    private readonly inquirerService: InquirerService,
  ) {
    super();
  }
  async run(_input: string[], options: EmbeddingCommandOptions): Promise<void> {
    let modelId = _input[0];
    // First attempt to get message from input or options
    let input: string | string[] = options.input ?? _input.splice(1);

    // Check for model existing
    if (!modelId || !(await this.modelsUsecases.findOne(modelId))) {
      // Model ID is not provided
      // first input might be message input
      input = _input ?? options.input;
      // If model ID is not provided, prompt user to select from running models
      const models = await this.psCliUsecases.getModels();
      if (models.length === 1) {
        modelId = models[0].modelId;
      } else if (models.length > 0) {
        modelId = await this.modelInquiry(models);
      } else {
        console.error('Model ID is required');
        process.exit(1);
      }
    }

    return this.chatCliUsecases
      .embeddings(modelId, input)
      .then((res) =>
        inspect(res, { showHidden: false, depth: null, colors: true }),
      )
      .then(console.log)
      .catch(console.error);
  }

  modelInquiry = async (models: ModelStat[]) => {
    const { model } = await this.inquirerService.inquirer.prompt({
      type: 'list',
      name: 'model',
      message: 'Select running model to chat with:',
      choices: models.map((e) => ({
        name: e.modelId,
        value: e.modelId,
      })),
    });
    return model;
  };

  @Option({
    flags: '-i, --input <input>',
    description:
      'Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request, pass an array of strings or array of token arrays.',
  })
  parseInput(value: string) {
    return value;
  }

  @Option({
    flags: '-e, --encoding_format <encoding_format>',
    description:
      'Encoding format for the embeddings. Supported formats are float and int.',
  })
  parseEncodingFormat(value: string) {
    return value;
  }

  @Option({
    flags: '-d, --dimensions <dimensions>',
    description:
      'The number of dimensions the resulting output embeddings should have. Only supported in some models.',
  })
  parseDimensionsFormat(value: string) {
    return value;
  }
}
