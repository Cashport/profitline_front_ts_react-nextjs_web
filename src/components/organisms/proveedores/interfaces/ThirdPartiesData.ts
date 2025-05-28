export interface IThirdPartiesData {
  id: number;
  projectId: number;
  subjectSubtypeId: number;
  name: string;
  documentNumber: string;
  documentType: number;
  createdAt: string;
  subtypeName: string;
  status: {
    id: number;
    name: string;
    color: string;
    backgroundColor: string;
  };
}
