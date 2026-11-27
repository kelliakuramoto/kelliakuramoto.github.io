// =====================================================
// EXPERIMENTS  (kind: 'experiment', shown under "What I want to know")
// Same block format as essays.
// =====================================================
export const EXPERIMENTS = [
  {
    id: 'sunscreeen',
    title: 'Just put on some damn sunscreen',
    byline: 'Trying to understand how to move from awareness to action',
    image: 'images/Writing/stick-sunscreen.jpg',
    imageAlt: 'Image of CeraVe stick sunscreen',
    subheader: 'Trying to understand how to move from awareness to action',
    blocks: [
      { type: 'heading', text: 'Observation' },
      { type: 'paragraph', text: 'I know myself to be someone who can exhibit foresight with delayed gratification. I workout everyday knowing that the effects on my health will not be seen until much later in life, I invest a part of my paycheck every month into my various savings account knowing that I can’t even access some of that money until I’m 65. This is all to say that I’m confident in my ability to do things in the present that will benefit me in the future, and yet I can’t seem to wear sunscreen.' },
      { type: 'paragraph', text: 'This has been an unanswered question [[question:077241c6-d554-4563-93a9-781164a47e8b|running in the background of my mind ]]for a while and I was reminded of it when I met up with my friend [[url:https://www.richakrishna.com/|Richa]], Designer & Creative Director at [[url:https://www.sakemlabs.com/|Sakem]] who has experience designing in the health-tech space. We got to talking about how many health-tech companies provide you with a lot of information about your body and then just expect you to take action. We both questioned the effectiveness of method because we felt it skipped the 2 important phases of change: personal investment and internal reflection. In our personal experiences, we knew that you had to care about the change enough to expend the energy and you had to conciously be aware of the impact it had on yourself to continue the changed behaviour. We iterated upon a cycle of change that we thought was representative of actual shifts in beavhiour.'},
      { type: 'image', src: 'images/Writing/cycle-of-change.png', alt: 'Cycle of information to awareness to action to impact' },
      { type: 'paragraph', text: 'This got me thinking about my own gap between awareness and action. I know have all the information needed to take sufficient action: the negative effects and potential cancer risk on your skin when you don’t wear sunscreen and how to acquire sunscreen at the store. I’m also aware that this is a problem but my behaviour has not shifted, why?' },
      { type: 'heading', text: 'Question' },
      { type: 'quote', text: 'How do people gather enough activation energy to change their behaviour when they have the information and awareness of a problem?' },
      { type: 'thought', text: 'I think in general I’m very curious about understanding how people operate because how you make decisions is ultimately how you live your life.', 
      },
      { type: 'heading', text: 'Hypothesis' },
      { type: 'paragraph', text: 'If I can understand how people successfully change their behaviour from not wearing sunscreen to applying it everyday, then maybe I can apply those same learnings to encourage and educate people on how to make larger changes in their life that could improve our society in the long term, such as building [[quote:circular-economy|circular habits]].' },
      { type: 'heading', text: 'Experiment' },
      { type: 'paragraph', text: 'The following are my notes from conversations that I’ve had with people on the topic of breaking, building, and maintaing habits in their personal life:' },
      { type: 'thought', 
        blocks: [
          { type: 'transcript', speaker: 'Kelli',  text: 'So why did you start wearing sunscreen consistently?' },
          { type: 'transcript', speaker: 'Interviewee', text: 'I found a brand of sunscreen that I actually liked and still use it because it makes my face feel super mositurized (the sunscreen is water based). One of the reasons I didn’t want to wear sunscreen before was because I felt like every brand I had tried before dried out my face and I really hate having dry skin. But once I found a brand that addressed my biggest obstacle to adoption then it made the habit of putting on sunscreen everyday very easy to do.' },
          { type: 'paragraph', text: 'Something that I thought of when we were having this conversation was that: There is no one reason, there is only your reason. For building new habits, or really anything in life, we often search for answers externally, advice from friends or self help books from proclaimed experts. And while I do believe that they can provide us with alternative perspectives and insight, they never seem to fit quite right because they are exactly that: a different perspective. What works for one person might not work for another, unless you have the same problem, with the same mindset, the same assumptions and so on. [[article:no-advice|I don’t believe in giving advice]], but if people insist, I always contextualize what I’m about to say with: this what I think given my specific persepctive on life and that it might not be the same for you so everything I say really should be taken with a grain of salt.'},
          { type: 'transcript', speaker: 'Kelli',  text: 'But then I guess my question is what made you start in the first place? I mean you said you’ve known for a while that you should wear it, so what was the catalyst for change?' },
          { type: 'transcript', speaker: 'Interviewee', text: 'I think I’ve always known that I wanted to invest more into my skin routine because I know that it takes time to take effect and that my skin wasn’t optimal but I felt like I didn’t have enough information. So one day I took a picture of my face, uploaded to ChatGPT, and asked from the perspective of a dermatologist what type of skin I had and what it would reccomend to improve it. But even after learning about my skin type, I think the true catalsyt for change was whether or not I cared enough to put in the energy. Health is very important to me and I decided that I wanted to address every component of my overall health, it was about acknowledging that my health wasn’t just body weight or hair or makeup. I also recognized that, as a woman building a brand and a business, your phusical apperance is the door to your mind and your opinions, so to some degree it does matter and I knew that I needed to start investing.' },
          { type: 'paragraph', text: 'It’s interesting how they were able to take something that they already valued: overall health, and just extend the defintion to encompass this new habit. Instead of trying generate activation energy from zero, you take something that you already care about and kind of trojan horse a new habit on top of it. This actually makes alot of sense because the care is already there, its just about redefining your values to encompass the behaviour you want to change. \n\n Another thing that I took away from this conversation was the idea that you don’t need to care about something at 100% and that the time spent can scale with how much you care. Intially my push back to investing in my skincare was that I just didnt care about it and so I didnt want to spend any time or energy. But what I failed to recognize was the assumption that I had to do everything at 100%. My parents instilled in me that you should fully commit to whatever you do (this is probably the reason why I’m not very good at having hobbies because the idea that you would be just okay at something is hard for me to grasp, but it’s something that I am working on). I know that I care about my friends and family at 100%, so I put a lot of time and energy into those relationships, but that I can also care about my skincare at 5% and spend a couple seconds each day to put on sunscreen.'},
        ],
      },
        { type: 'thought', 
        blocks: [
        { type: 'transcript', speaker: 'Interviewee', text: 'Actually the hardest thing I’ve had to do personally, was quit vaping.' },
        { type: 'transcript', speaker: 'Kelli',  text: 'Why do you think it’s been so hard to quit?' },
        { type: 'transcript', speaker: 'Interviewee', text: 'Honestly I don’t even get a head rush anymore because I’m a chronic user, if I want to feel something I have to go the whole day without vaping and then hit it. Most of the time I just do it because I’m bored, it’s like an oral fixation that’s become a bad habit.' },
        { type: 'transcript', speaker: 'Kelli',  text: 'But do you think that you haven’t been able to quit because the immediate consequence to your health isn’t apparent, whereas lets say you don’t workout for a couple weeks and eat poorly then the effects to your body are much faster?' },
        { type: 'transcript', speaker: 'Interviewee', text: 'Oh for sure, I’m very out of sight out of mind. It’s the same thing with voting, I was talking about this with my friend and we were both saying how we want to be more informed in current event and politics but sometimes it’s so hard to care because it doesn’t effect me personally.' },
        { type: 'paragraph', text: 'I’m running another experiement where I’m trying to understand what characteritics are essential to equip kids and people in general to have the confidence to do hard things and it’s clear that foresight, or at least future planning, is a theme that comes up more and more. With this conversation, I’m curious how to you might show people the effect to their health sooner in situations where the effects might not be seen for years or even decades. '},
        ],
      },
    ],
  },
];
