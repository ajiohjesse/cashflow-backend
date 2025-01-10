import express, { type Application } from 'express';
import { Server } from 'http';

interface AppServices {}

class App {
  private app: Application;
  private server?: Server;

  constructor(private readonly services: AppServices) {
    this.app = express();
    this.setupMiddleware();
    this.initializeRoutes();
    this.setupDocumentation();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private initializeRoutes() {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  }

  private setupDocumentation() {
    this.app.use('/docs', express.static('docs'));
    this.app.get('/docs', (req, res) => {
      res.redirect('/docs/index.html');
    });
  }

  private setupErrorHandling() {
    this.app.use((req, res, next) => {
      res.status(404).json({ message: 'Resource not found' });
    });
    this.app.use((err: Error, req: express.Request, res: express.Response) => {
      res.status(500).json({ message: 'Internal server error' });
    });
  }

  getApp(): Application {
    return this.app;
  }

  start(): void {
    this.server = this.app.listen(3000, () => {
      console.log(`running on port 3000`);
    });

    this.handleProcessSignals();
  }

  private handleProcessSignals(): void {
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server?.close(err => {
          if (err) {
            console.error('Error during server shutdown:', err);
            reject(err);
          } else {
            console.log('Server closed successfully.');
            resolve();
          }
        });
      });
    }
  }
}

export { App, type AppServices };

const app = new App({});
