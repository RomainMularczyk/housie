enum ScrapingJobType {
  HOUSE_SCRAPING = 'house-scraping',
  SEARCH_SCRAPING = 'search-scraping',
}

enum JobStatusType {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

type ScrapingJob = {
  id: string;
  type: ScrapingJobType;
  url: string;
  createdAt: Date;
};

type JobStatus = {
  id: string;
  status: JobStatusType;
  updatedAt: Date;
};

export type { ScrapingJob, JobStatus };
export { ScrapingJobType, JobStatusType };
