type ConfigDto = {
  defaultOwner: string;
  defaultRepo: string;
  databaseType?: string;
  cronSchedule?: string;
  startDate?: string;
};

export default ConfigDto;
