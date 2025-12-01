# Testing Your Data Management System

## ✅ Quick Verification Checklist

### 1. Test Locally First

```bash
# Start your dev server
npm run dev
```

### 2. Access Admin Panel
- Navigate to: `http://localhost:5000/admin/login`
- Log in with your admin credentials

### 3. Find Data Management Page
- Look in the sidebar under **"System"**
- Click **"Data Management"**
- You should see 4 seed scripts listed:
  1. AI Prompt Templates (Critical)
  2. System Configurations (Config)
  3. Blog Posts (Content)
  4. Master Seed (All) (Critical)

### 4. Test Individual Seed

Click **"Run Seed"** on "AI Prompt Templates":

**Expected Result:**
```json
{
  "success": true,
  "created": 7,  // or 0 if already exist
  "updated": 0,  // or 7 if updating
  "skipped": 0,  // or 7 if current
  "duration": 200 // milliseconds
}
```

**Visual Feedback:**
- ✅ Green success message appears
- ✅ Shows: "Last run: [timestamp] • 7 created"
- ✅ Button returns to "Run Seed" state

### 5. Test Master Seed

Click **"Run All Seeds"**:

**Expected Result:**
- Takes ~30 seconds
- Shows success message
- Result includes all subsections:
  - aiPrompts: { created, updated, skipped }
  - configs: { flags, widgets, testimonials }
  - blogs: { created, updated, skipped }

### 6. Test Export

Click **"Export All Data"**:

**Expected Result:**
- ✅ Downloads JSON file named: `backup-{tenantId}-{date}.json`
- ✅ File contains sections: blogs, featureFlags, testimonials, aiPrompts, projects, media
- ✅ File size: ~50-500KB depending on data

---

## 🔍 Verifying Seeds Worked

### Check AI Prompts
1. Go to **Admin > Default AI Prompts**
2. Should see 7 prompts:
   - Artistic Director (Stage 1)
   - Technical Director (Stage 2)
   - Executive Producer (Stage 5.5)
   - Split Scene Specialist
   - Gallery Scene Specialist
   - Quote Scene Specialist
   - Fullscreen Scene Specialist

### Check Feature Flags
1. Go to **Admin > Feature Flags**
2. Should see flags:
   - Theme Toggle ✅
   - E-Book Lead Magnets ✅
   - Portfolio Wizard ✅
   - Advanced Director Controls ✅
   - Media Library ✅
   - CRM Workspace ✅

### Check Blogs
1. Go to **Admin > Blog Posts**
2. Should see 3 posts:
   - "The Complete Guide to Building a GTM Engine..."
   - "Why Your SDR Isn't Hitting Quota..."
   - "The Signal Factory..."

### Check Testimonials
1. Go to **Admin > Content Library** (or wherever testimonials are managed)
2. Should see 3 testimonials:
   - Sarah Chen (TechFlow)
   - Marcus Johnson (DataPulse)
   - Emily Rodriguez (CloudScale)

---

## 🧪 Testing from Command Line

```bash
# Test individual seeds
npm run seed:ai-prompts
npm run seed:configs
npm run seed:blogs

# Test master seed
npm run seed:all

# Or run directly with tsx
npx tsx scripts/seed-production-ai-prompts.ts
```

**Expected Console Output:**
```
🎨 Seeding production AI prompts...
  ✅ Created: Artistic Director (Stage 1)
  ✅ Created: Technical Director (Stage 2)
  ✅ Created: Executive Producer (Stage 5.5)
  ✅ Created: Split Scene Specialist (Stage 3.5.1)
  ✅ Created: Gallery Scene Specialist (Stage 3.5.2)
  ✅ Created: Quote Scene Specialist (Stage 3.5.3)
  ✅ Created: Fullscreen Scene Specialist (Stage 3.5.4)

📊 Summary: 7 created, 0 updated, 0 skipped
✅ AI Prompts seeding complete!
```

---

## 🚀 Testing on Vercel

### After Deployment

1. **Visit your Vercel deployment**
   - `https://your-app.vercel.app/admin/login`

2. **Log in**
   - Use your admin credentials

3. **Navigate to Data Management**
   - Admin sidebar > System > Data Management

4. **Run Master Seed**
   - Click "Run All Seeds"
   - Wait ~30 seconds
   - Verify success

5. **Verify Results**
   - Check AI Prompts page
   - Check Feature Flags page
   - Check Blog Posts page
   - Check testimonials

---

## 🐛 Common Issues & Solutions

### "Tenant ID Required"
**Cause:** Not logged in or session expired
**Solution:** Log out and log back in

### Seed appears to succeed but data doesn't show
**Cause:** Using wrong tenant or database
**Solution:** Check you're logged in with correct account

### "Failed to fetch"
**Cause:** API route not registered or server error
**Solution:** 
1. Check server logs
2. Verify routes are registered in `/server/routes.ts`
3. Restart dev server

### Seeds run but return 0 created/updated
**Cause:** Data already exists and versions match
**Solution:** This is normal! Seeds are idempotent

### Export downloads but file is empty
**Cause:** No data in database for your tenant
**Solution:** Run seeds first, then export

---

## ✅ Success Criteria

Your data management system is working if:

- ✅ Can access Data Management page at `/admin/data-management`
- ✅ Can see all 4 seed scripts listed
- ✅ Can run individual seeds without errors
- ✅ Can run master seed successfully
- ✅ Can export data and get valid JSON file
- ✅ Data appears in respective admin pages after seeding
- ✅ Can run seeds multiple times without errors (idempotent)

---

## 📊 Performance Benchmarks

**Expected Timing:**
- AI Prompts: < 5 seconds
- Configs: < 10 seconds
- Blogs: < 5 seconds
- Master Seed: < 30 seconds
- Export: < 3 seconds

If seeds take significantly longer:
1. Check database connection (slow network?)
2. Check database performance (Neon free tier has limits)
3. Check for large amounts of existing data

---

## 🎯 Next: Deploy to Vercel!

Once local testing passes:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add data management system with seed scripts"
   git push origin main
   ```

2. **Vercel auto-deploys**
   - Wait for deployment to complete

3. **Run migrations** (if needed)
   - From Vercel project settings > Data tab
   - Or connect to production DB and run migrations

4. **Test on Vercel**
   - Follow "Testing on Vercel" section above

5. **Create first backup**
   - Export your data
   - Save the JSON file somewhere safe

---

**You're all set! 🎉**

Your production deployments will now be:
1. Push to Vercel
2. Navigate to Data Management
3. Click "Run All Seeds"
4. Done! ✅

