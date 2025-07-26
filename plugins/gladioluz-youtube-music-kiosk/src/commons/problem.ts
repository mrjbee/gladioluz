export class ProblemDetails extends Error {
    constructor(
      public status: number,
      public detail: string,
      public instance: string,
      public type: string = 'about:blank',
      public title: string = status === 400 ? 'Bad Request' : 'Internal Server Error'
    ) {
      super(detail);
    }
  
    toJSON() {
      return {
        type: this.type,
        title: this.title,
        status: this.status,
        detail: this.detail,
        instance: this.instance
      };
    }
  }
  