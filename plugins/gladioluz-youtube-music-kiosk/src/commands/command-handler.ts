export interface CommandContext {
    args: Record<string, any>;
  }
  
  export interface CommandResult {
    result: 'ok';
    data?: any;
  }
  
  export interface CommandHandler {
    run(context: CommandContext): Promise<CommandResult>;
  }
  