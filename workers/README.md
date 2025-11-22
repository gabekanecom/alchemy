# Background Workers

This directory contains BullMQ background workers for processing asynchronous jobs.

## Workers

### 1. Content Generation Worker (`content-worker.ts`)
Processes content generation jobs from the content queue.

**Responsibilities:**
- Fetches brand and idea details
- Builds AI prompts based on brand voice and content requirements
- Generates content using Claude or GPT
- Parses and structures the generated content
- Calculates quality scores
- Saves generated content to database

**Concurrency:** 3 jobs simultaneously
**Rate Limit:** 10 jobs per minute

### 2. Research Worker (`research-worker.ts`)
Performs research analysis on ideas.

**Research Types:**
- **Keywords**: SEO keyword research and targeting
- **Competitors**: Competitive analysis and content gaps
- **Trends**: Trend analysis and viral potential
- **Full**: All research types combined

**Responsibilities:**
- Performs AI-powered research using Claude
- Calculates virality, relevance, and competition scores
- Updates ideas with research data and scores

**Concurrency:** 2 jobs simultaneously
**Rate Limit:** 5 jobs per minute

### 3. Media Generation Worker (`media-worker.ts`)
Generates images and thumbnails using DALL-E.

**Media Types:**
- **Image**: Full-size generated images
- **Thumbnail**: Smaller preview images

**Responsibilities:**
- Generates images using OpenAI DALL-E 3
- Creates media records in database
- Tracks metadata and prompts

**Concurrency:** 2 jobs simultaneously
**Rate Limit:** 10 jobs per minute

## Running Workers

### Development
```bash
pnpm workers
```

This will start all workers in a single process.

### Production
For production, it's recommended to run workers as separate processes:

```bash
# Terminal 1 - Content Worker
tsx workers/content-worker.ts

# Terminal 2 - Research Worker
tsx workers/research-worker.ts

# Terminal 3 - Media Worker
tsx workers/media-worker.ts
```

Or use a process manager like PM2:

```bash
pm2 start workers/index.ts --name alchemy-workers
```

## Environment Variables

Workers require the following environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://:password@host:port
ANTHROPIC_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Queue Management

### View Queue Status
```bash
# Using Redis CLI
redis-cli
> LLEN bull:content-generation:wait
> LLEN bull:research:wait
> LLEN bull:media-generation:wait
```

### Clear Failed Jobs
Jobs that fail are automatically retried (3 attempts). After all retries are exhausted, they move to the failed queue.

## Job Flow

### Content Generation
1. User creates content queue entry via API
2. API adds job to BullMQ queue
3. Content worker picks up job
4. Worker generates content using AI
5. Worker saves content to database
6. Queue status updated to "completed"

### Research
1. User triggers research on an idea
2. Research job added to queue
3. Research worker analyzes the idea
4. Worker updates idea with research data
5. Scores calculated and saved

### Media Generation
1. Content generation worker or user triggers media job
2. Media worker generates image using DALL-E
3. Worker saves media record
4. Media URL returned

## Error Handling

All workers include comprehensive error handling:
- Failed jobs are automatically retried (max 3 attempts)
- Errors are logged with detailed context
- Database records updated with error status
- Failed jobs can be manually retried

## Monitoring

Workers emit events that can be monitored:

```typescript
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

## Performance Tuning

Adjust concurrency and rate limits based on:
- API rate limits (Claude, OpenAI)
- Server resources
- Database connection pool

Edit worker configuration:

```typescript
{
  connection: redis,
  concurrency: 3, // Adjust this
  limiter: {
    max: 10,      // Max jobs
    duration: 60000, // Per minute
  },
}
```
