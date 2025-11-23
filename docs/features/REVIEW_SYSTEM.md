# Review System Documentation

## Overview

The Review System allows users to rate and review executors on Key-Kingdom.org, providing social proof and helping buyers make informed decisions. This is a **Phase 2 feature** that builds on the existing marketplace infrastructure.

---

## Core Features

### 1. Review Submission
- **Star Rating** (1-5 stars, required)
- **Review Title** (optional, max 100 characters)
- **Review Content** (optional, 50-500 characters)
- **Verified Purchase Badge** (automatic based on purchase history)
- **One review per executor per user** (enforced at database level)

### 2. Review Display
- Average rating displayed prominently on executor cards
- Total review count
- Recent reviews section on detail pages
- Ability to sort reviews by:
  - Most Recent
  - Highest Rated
  - Lowest Rated
  - Most Helpful

### 3. Review Engagement
- **Helpful/Unhelpful Voting**
  - Users can mark reviews as helpful or not
  - One vote per review per user
  - Helpful count displayed publicly
- **Review Replies** (Phase 3 - Vendor feature)
  - Vendors can reply to reviews of their executors
  - One reply per review

### 4. Moderation
- Admin tools to:
  - Flag inappropriate reviews
  - Hide reviews from public view
  - Add moderator notes
  - View flagged reviews dashboard
- User reporting system
  - Report review button
  - Report reasons: Spam, Offensive, Fake, etc.

---

## Database Schema

The schema is already defined in `prisma/schema.prisma` (commented out). Uncomment when implementing:

```prisma
model Review {
  id          String   @id @default(uuid())
  executorId  String   // Executor being reviewed
  userId      String   // User who wrote review

  // Review content
  rating      Int      // 1-5 stars
  title       String?
  content     String?  // Optional text review (50-500 chars)

  // Verification
  verified    Boolean  @default(false) // Verified purchase badge

  // Moderation
  flagged     Boolean  @default(false)
  hidden      Boolean  @default(false)
  moderatorNote String?

  // Engagement
  helpfulCount Int     @default(0)
  unhelpfulCount Int   @default(0)

  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id])
  votes       ReviewVote[]

  @@index([executorId])
  @@index([userId])
  @@index([rating])
  @@index([createdAt])
  @@map("reviews")
}

model ReviewVote {
  id          String   @id @default(uuid())
  reviewId    String
  userId      String
  helpful     Boolean  // true = helpful, false = unhelpful

  createdAt   DateTime @default(now())

  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([reviewId, userId]) // One vote per user per review
  @@map("review_votes")
}
```

---

## API Endpoints

### Public Endpoints (Read)

#### **GET /api/executors/:id/reviews**
Get reviews for a specific executor.

**Query Parameters:**
- `sort` - Sort order: `recent` (default), `highest`, `lowest`, `helpful`
- `limit` - Number of reviews (default: 20, max: 100)
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "rating": 5,
        "title": "Amazing executor!",
        "content": "Works perfectly, no issues at all.",
        "verified": true,
        "helpfulCount": 24,
        "unhelpfulCount": 1,
        "createdAt": "2025-11-20T10:00:00Z",
        "user": {
          "id": "user_456",
          "name": "JohnDoe",
          "avatar": "https://..."
        }
      }
    ],
    "stats": {
      "totalReviews": 234,
      "averageRating": 4.7,
      "ratingDistribution": {
        "5": 150,
        "4": 60,
        "3": 15,
        "2": 5,
        "1": 4
      }
    },
    "pagination": {
      "total": 234,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### **GET /api/reviews/stats**
Get overall review statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 15234,
    "averageRating": 4.3,
    "recentReviews": [...]
  }
}
```

---

### Authenticated Endpoints (Write)

#### **POST /api/executors/:id/reviews**
Submit a review for an executor.

**Requires:** User authentication

**Request Body:**
```json
{
  "rating": 5,
  "title": "Great executor!",
  "content": "Works perfectly on Windows 11. No bugs found."
}
```

**Validation:**
- `rating`: Required, 1-5
- `title`: Optional, max 100 chars
- `content`: Optional, 50-500 chars (or can be omitted)
- User must not have already reviewed this executor
- User must be logged in

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rev_123",
    "executorId": "exec_456",
    "rating": 5,
    "verified": false,
    "createdAt": "2025-11-22T14:30:00Z"
  }
}
```

#### **PATCH /api/reviews/:id**
Update an existing review.

**Requires:** User authentication (must be review author)

**Request Body:**
```json
{
  "rating": 4,
  "title": "Updated title",
  "content": "Updated content"
}
```

#### **DELETE /api/reviews/:id**
Delete a review.

**Requires:** User authentication (must be review author or admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rev_123",
    "deletedAt": "2025-11-22T15:00:00Z"
  }
}
```

#### **POST /api/reviews/:id/vote**
Vote on review helpfulness.

**Requires:** User authentication

**Request Body:**
```json
{
  "helpful": true  // true = helpful, false = unhelpful
}
```

**Validation:**
- User can only vote once per review
- Changing vote updates existing vote

---

### Admin Endpoints

#### **POST /api/admin/reviews/:id/flag**
Flag a review for moderation.

**Requires:** Admin authentication

**Request Body:**
```json
{
  "reason": "Spam",
  "note": "Promotional content detected"
}
```

#### **PATCH /api/admin/reviews/:id/moderate**
Moderate a review (hide, unflag, etc.).

**Requires:** Admin authentication

**Request Body:**
```json
{
  "hidden": true,
  "flagged": false,
  "moderatorNote": "Hidden due to inappropriate language"
}
```

---

## UI Components

### ExecutorReviews Component
**Location:** `src/components/executor/ExecutorReviews.tsx`

**Features:**
- Displays review list with pagination
- Shows average rating with star visualization
- Rating distribution histogram
- Sort dropdown
- Helpful/Unhelpful voting buttons
- "Write a Review" button (if logged in)

```tsx
<ExecutorReviews
  executorId="exec_123"
  averageRating={4.7}
  totalReviews={234}
/>
```

### ReviewForm Component
**Location:** `src/components/executor/ReviewForm.tsx`

**Features:**
- Star rating selector (interactive)
- Title input (optional)
- Content textarea with character counter
- Validation and error messages
- Submit button with loading state

```tsx
<ReviewForm
  executorId="exec_123"
  onSubmit={handleReviewSubmit}
  onCancel={handleCancel}
/>
```

### ReviewCard Component
**Location:** `src/components/executor/ReviewCard.tsx`

**Features:**
- User avatar and name
- Star rating display
- Verified purchase badge
- Review content
- Helpful/Unhelpful buttons with counts
- Timestamp (e.g., "2 days ago")
- Edit/Delete buttons (if author)

```tsx
<ReviewCard
  review={review}
  onVote={handleVote}
  currentUserVote={userVote}
/>
```

### RatingDistribution Component
**Location:** `src/components/executor/RatingDistribution.tsx`

**Features:**
- Horizontal bar chart showing 5-star to 1-star distribution
- Percentage and count for each rating
- Clickable bars to filter reviews

```tsx
<RatingDistribution
  distribution={{
    5: 150,
    4: 60,
    3: 15,
    2: 5,
    1: 4
  }}
  onFilterByRating={handleFilter}
/>
```

---

## Business Logic

### Review Aggregation
When a new review is submitted or updated:

1. Recalculate executor's average rating
2. Update total review count
3. Update rating distribution
4. Trigger cache invalidation for executor page

**Implementation:**
```typescript
async function updateExecutorRatingStats(executorId: string) {
  const reviews = await prisma.review.findMany({
    where: { executorId, hidden: false },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Update executor record (if storing in executor table)
  // Or cache in Redis
}
```

### Verified Purchase Detection
**Logic:**
- Check if user has clicked "Buy Now" for this executor
- Track purchase events in analytics
- Set `verified: true` on review if purchase confirmed

**Implementation (Phase 3):**
```typescript
async function checkVerifiedPurchase(userId: string, executorId: string): Promise<boolean> {
  const purchase = await prisma.purchaseEvent.findFirst({
    where: {
      userId,
      executorId,
      createdAt: { lt: new Date() } // Purchase before review
    }
  });

  return !!purchase;
}
```

### Spam Detection
**Automated Checks:**
- Duplicate content detection (same review text multiple times)
- Rate limiting (max 5 reviews per hour per user)
- Language filter (profanity, offensive terms)
- Minimum account age (7 days before can review)

**Manual Moderation:**
- User reporting system
- Admin dashboard for flagged reviews
- Moderator notes and actions

---

## Integration Points

### 1. Executor Detail Page
**Location:** `src/app/executor/[slug]/page.tsx`

Add review section below executor details:
```tsx
<ExecutorDetails executor={executor} />

{/* Reviews Section */}
<section className="mt-12">
  <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
  <ExecutorReviews executorId={executor.id} />
</section>
```

### 2. Executor Cards/Table
**Location:** `src/components/shop/ExecutorRow.tsx`, `ExecutorCard.tsx`

Display average rating and count:
```tsx
<div className="flex items-center gap-2">
  <StarRating rating={executor.rating.average} />
  <span className="text-sm text-gray-400">
    ({executor.rating.count})
  </span>
</div>
```

### 3. User Profile
**Location:** `src/app/profile/page.tsx`

Show user's reviews:
```tsx
<UserReviews userId={currentUser.id} />
```

---

## SEO Optimization

### Structured Data
Add Review schema.org markup:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Solara Executor",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "234"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "JohnDoe"
      },
      "datePublished": "2025-11-20",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "Amazing executor! Works perfectly."
    }
  ]
}
```

---

## Analytics & Metrics

Track the following:
- **Review Submission Rate** - % of users who leave reviews
- **Average Review Length** - Character count
- **Verified vs Unverified** - Ratio
- **Helpful Vote Rate** - % of reviews voted on
- **Moderation Rate** - % of reviews flagged/hidden
- **Rating Distribution Changes** - Track over time

---

## Implementation Phases

### Phase 1: Basic Reviews (2-3 weeks)
- [ ] Uncomment and migrate database schema
- [ ] Implement review submission API
- [ ] Create ReviewForm component
- [ ] Create ReviewCard component
- [ ] Integrate into executor detail pages
- [ ] Basic validation and error handling

### Phase 2: Engagement (1-2 weeks)
- [ ] Implement helpful/unhelpful voting
- [ ] Add rating distribution visualization
- [ ] Implement review sorting
- [ ] Add pagination
- [ ] User review history page

### Phase 3: Moderation (1-2 weeks)
- [ ] Admin moderation dashboard
- [ ] User reporting system
- [ ] Automated spam detection
- [ ] Email notifications for review responses

### Phase 4: Advanced Features (2-3 weeks)
- [ ] Vendor review replies
- [ ] Verified purchase tracking
- [ ] Review images/screenshots
- [ ] Review editing history
- [ ] Advanced analytics dashboard

---

## Testing Strategy

### Unit Tests
- Review validation logic
- Rating calculation
- Helpful vote counting
- Spam detection algorithms

### Integration Tests
- Review submission flow
- Vote submission
- Moderation actions
- Rating aggregation

### E2E Tests
- Complete review submission flow
- Review editing and deletion
- Helpful voting
- Admin moderation workflow

---

## Security Considerations

1. **Rate Limiting**
   - Limit review submissions to prevent spam
   - Limit helpful votes to prevent manipulation

2. **Input Validation**
   - Sanitize all user input
   - Prevent XSS attacks in review content
   - Validate rating range (1-5)

3. **Authorization**
   - Verify user owns review before edit/delete
   - Verify admin role for moderation actions
   - Check verified purchase status

4. **Content Moderation**
   - Filter profanity and offensive language
   - Detect duplicate/spam reviews
   - Manual review queue for flagged content

---

## Performance Optimization

1. **Caching**
   - Cache executor ratings and stats (Redis)
   - Invalidate on new review or vote
   - Cache review lists per executor

2. **Database Indexing**
   - Index on `executorId` for fast lookups
   - Index on `createdAt` for sorting
   - Index on `rating` for filtering
   - Composite index on `[executorId, createdAt]`

3. **Pagination**
   - Limit reviews per page (20-50)
   - Use cursor-based pagination for large datasets

4. **Aggregation**
   - Pre-calculate rating stats
   - Update on write, not read
   - Store in executor record or cache

---

## Future Enhancements

- **Review Images**: Allow users to upload screenshots
- **Review Reactions**: Beyond helpful/unhelpful (e.g., 😂, 🔥, 👍)
- **Review Tags**: "Performance", "Stability", "Support", etc.
- **Trending Reviews**: Show most helpful reviews from past week
- **Review Rewards**: Points/badges for helpful reviewers
- **AI Moderation**: Automated content analysis
- **Review Summaries**: AI-generated summaries of all reviews

---

## Migration from Comments (if applicable)

If there's an existing comment system:

1. Export existing comments
2. Convert to review format (extract rating if present)
3. Mark as unverified
4. Import into new schema
5. Notify users of migration

---

**Status:** 📋 Documented for future implementation
**Priority:** High (Phase 2 feature)
**Estimated Effort:** 6-8 weeks for complete implementation
**Dependencies:** User authentication system, executor detail pages

---

*This documentation should be updated as the review system is implemented.*
