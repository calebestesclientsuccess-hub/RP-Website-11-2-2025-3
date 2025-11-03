interface BlueprintEmailData {
  email: string;
  path: string;
  q1: string;
  q2?: string;
}

const valueMapping = {
  q1: {
    simple: 'Simple Value Prop',
    complex: 'Complex Value Prop',
  },
  q2: {
    low: '$5k-$15k/mo Budget',
    target: '$15k-$40k/mo Budget',
    enterprise: '$40k+/mo Budget',
  },
};

export function getBlueprintEmailHtml(data: BlueprintEmailData): string {
  const q1Display = valueMapping.q1[data.q1 as keyof typeof valueMapping.q1] || data.q1;
  const q2Display = data.q2 ? valueMapping.q2[data.q2 as keyof typeof valueMapping.q2] || data.q2 : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your GTM Assessment Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .results-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .result-item {
      margin: 10px 0;
    }
    .result-label {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
      opacity: 0.9;
    }
    .result-value {
      font-size: 18px;
      margin-top: 5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .signature {
      margin-top: 20px;
      font-style: italic;
    }
    .unsubscribe {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
    .unsubscribe a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your GTM Assessment Results</h1>
    </div>
    
    <p>Thanks for taking the assessment. We've compiled your results below.</p>
    
    <div class="results-card">
      <h2 style="margin-top: 0; font-size: 20px;">Your Assessment Summary</h2>
      <div class="result-item">
        <div class="result-label">Complexity</div>
        <div class="result-value">${q1Display}</div>
      </div>
      ${q2Display ? `
      <div class="result-item">
        <div class="result-label">Investment Level</div>
        <div class="result-value">${q2Display}</div>
      </div>
      ` : ''}
    </div>
    
    <p>Based on your answers, we've identified the best path forward for your go-to-market strategy. Your personalized action plan is waiting for you.</p>
    
    <div class="footer">
      <p>We'll email you occasionally when there's something worth sharing.</p>
      <div class="signature">
        Thanks again,<br>
        <strong>RP Growth Team</strong>
      </div>
      <div class="unsubscribe">
        <a href="#unsubscribe">Click here if you'd prefer we not do that</a> or 
        <a href="#preferences">click here to tell us exactly what kind of messages you'd like to see</a>.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getBlueprintEmailSubject(data: BlueprintEmailData): string {
  return 'Your GTM Assessment Results - Revenue Party';
}
