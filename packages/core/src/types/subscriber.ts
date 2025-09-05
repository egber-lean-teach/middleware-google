export interface ISubscriber {
  id: string;
  email: string;
  credential: {
    name: string;
    value: string;
  };
}
