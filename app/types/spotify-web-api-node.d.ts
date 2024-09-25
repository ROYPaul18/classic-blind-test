declare module 'spotify-web-api-node' {
    import { EventEmitter } from 'events';
  
    export type SearchOptions = {
      limit?: number;
      offset?: number;
      market?: string;
    };
  
    export type TrackObjectSimplified = {
      id: string;
      name: string;
      artists: { name: string }[];
    };
  
    export type SearchResponse = {
      body: {
        tracks: {
          items: TrackObjectSimplified[];
        };
      };
    };
  
    class SpotifyWebApi extends EventEmitter {
      constructor(options?: { clientId?: string; clientSecret?: string });
      setAccessToken(token: string): void;
      searchTracks(query: string, options?: SearchOptions): Promise<SearchResponse>;
    }
  
    export default SpotifyWebApi;
  }