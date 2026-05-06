export default {
    site: 'https://topmark.pro',
  
    urls: [
      '/',
      '/login',
      '/register',
      '/gigs',
      '/mygigs',
      '/profile/edit',
      '/orders',
    ],
  
    scanner: {
      crawler: false,
      samples: 1,
    },
  
    hooks: {
      'puppeteer:before-goto': async (ctx) => {
        const page = ctx.page ?? ctx.tasks?.page ?? Object.values(ctx).find(v => v?.evaluateOnNewDocument);
        if (!page) return;
        await page.evaluateOnNewDocument(() => {
          localStorage.setItem('currentUser', JSON.stringify({
            id: 5,
            username: 'Howard1',
            email: 'davischuuck@gmail.com',
            token: '439a59e93e0ececf2f949be5a252ff371c12454a',
            user_type: 'expert',
            isSeller: true,
          }));
        });
      },
    },
  }