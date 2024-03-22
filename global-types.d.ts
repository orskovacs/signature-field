declare global {
  type InkPresenterParam = {
    readonly presentationArea?: Element;
  };

  type InkTrailStyle = {
    color: string;
    diameter: number;
  };

  interface InkPresenter {
    readonly presentationArea?: Element;
    readonly expectedImprovement: number;

    updateInkTrailStartPoint(event: PointerEvent, style: InkTrailStyle): void;
  }

  interface Ink {
    requestPresenter(param?: InkPresenterParam): Promise<InkPresenter>;
  }

  interface Navigator {
    readonly ink: Ink;
  }
}

export {};
