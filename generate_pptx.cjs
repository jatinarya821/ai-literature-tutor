const pptxgen = require('pptxgenjs');

let pptx = new pptxgen();

// Master slide style
pptx.layout = 'LAYOUT_16x9';
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FFFFFF' },
  objects: [
    { text: { text: "LitTutor.ai", options: { x: 0.5, y: 0.2, w: 3, h: 0.5, fontSize: 14, color: '7C3AED', bold: true } } },
    { line: { x: 0.5, y: 0.7, w: 9, h: 0, line: '7C3AED', lineSize: 1 } }
  ]
});

// SLIDE 1: Title
let slide1 = pptx.addSlide();
slide1.addText('📚 LitTutor.ai', { x: 1, y: 1.5, w: 8, h: 1, fontSize: 44, bold: true, align: 'center', color: '1E293B' });
slide1.addText('Your Interactive AI Literature Companion', { x: 1, y: 2.5, w: 8, h: 0.5, fontSize: 24, align: 'center', color: '64748B' });
slide1.addText('Team Name: [Insert Your Team Name]\nProject Title: Revolutionizing Literature Comprehension', { x: 1, y: 4, w: 8, h: 1, fontSize: 18, align: 'center', color: '333333' });

// SLIDE 2: Problem
let slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('The Problem', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide2.addText([
  { text: 'Passive Reading:\n', options: { bold: true, fontSize: 20 } },
  { text: 'Students often read classic books without fully comprehending the deep themes, symbolism, or historical context.\n\n', options: { fontSize: 18 } },
  { text: 'Lack of Accessible Tutors:\n', options: { bold: true, fontSize: 20 } },
  { text: 'Hiring personal literature tutors is expensive, and generic online summaries lack interactivity.\n\n', options: { fontSize: 18 } },
  { text: 'Static Information:\n', options: { bold: true, fontSize: 20 } },
  { text: 'Existing library apps only show you a book cover and a summary; they don\'t let you engage with the material.', options: { fontSize: 18 } }
], { x: 0.5, y: 2, w: 9, h: 3.5, color: '333333', bullet: true });

// SLIDE 3: Solution
let slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('Our Solution & Objectives', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide3.addText('LitTutor is a modern web application that bridges the gap between passive reading and active learning.', { x: 0.5, y: 2, w: 9, h: 0.5, fontSize: 18, color: '64748B' });
slide3.addText([
  { text: 'Premium Interface: Provide a stunning, user-friendly portal for discovering literature.\n\n', options: { fontSize: 18 } },
  { text: 'Persistent Library: Allow users to build a personal, saved library of study material.\n\n', options: { fontSize: 18 } },
  { text: 'Interactive Intelligence: Integrate an advanced AI Chatbot that quizzes users, analyzes themes, and acts as an on-demand literature professor.', options: { fontSize: 18 } }
], { x: 0.5, y: 3, w: 9, h: 2, color: '333333', bullet: true });

// SLIDE 4: Technologies
let slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('Technology & APIs Used', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide4.addText([
  { text: 'Frontend Framework: Built with React.js and Vite for lightning-fast performance.\n\n', options: { fontSize: 18 } },
  { text: 'Styling: Custom Vanilla CSS utilizing modern Glassmorphism, CSS Gradients, and responsive layouts.\n\n', options: { fontSize: 18 } },
  { text: 'Database API: The Open Library API is used to fetch live book metadata, covers, descriptions, and character lists.\n\n', options: { fontSize: 18 } },
  { text: 'AI Engine API: The Pollinations AI API is used to process natural language and generate deep, dynamic literary analysis on the fly without requiring an API key.', options: { fontSize: 18 } }
], { x: 0.5, y: 2, w: 9, h: 3, color: '333333', bullet: true });

// SLIDE 5: Discovery Feature
let slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.addText('Key Feature: Dynamic Discovery', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide5.addText([
  { text: 'Live Search Engine: Users can search for any book in existence, and the app instantly queries the Open Library database.\n\n', options: { fontSize: 18 } },
  { text: 'Automated Data Extraction: The app dynamically extracts and formats the Book Cover, Synopsis, Author, and a beautiful tag-cloud of Characters and Literary Themes.\n\n', options: { fontSize: 18 } },
  { text: 'My Library System: Users can click "Save to Library," and the app securely saves their collection directly to their local browser storage.', options: { fontSize: 18 } }
], { x: 0.5, y: 2, w: 9, h: 3, color: '333333', bullet: true });

// SLIDE 6: Chatbot Feature
let slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide6.addText('Key Feature: The AI Chatbot', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide6.addText([
  { text: 'Context-Aware: The Chatbot automatically knows exactly which book you are looking at and adapts its knowledge instantly.\n\n', options: { fontSize: 18 } },
  { text: 'Quick-Start Prompts: Users can click buttons like "Themes" or "Quiz Me!" to instantly launch an interactive lesson without needing to type anything.\n\n', options: { fontSize: 18 } },
  { text: 'Exportable Study Notes: Users can click the "Export" button to automatically download their entire conversation with the AI as a clean .txt study guide!', options: { fontSize: 18 } }
], { x: 0.5, y: 2, w: 9, h: 3, color: '333333', bullet: true });

// SLIDE 7: AI System Workflow
let slide7 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide7.addText('AI System Workflow Architecture', { x: 0.5, y: 0.8, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });

let nodeProps = { fill: 'FFFFFF', color: '333333', align: 'center', valign: 'middle', fontSize: 14, line: '7C3AED', lineSize: 2, shadow: { type: 'outer', color: '000000', blur: 5, offset: 3, opacity: 0.2 } };
let aiNodeProps = { fill: '7C3AED', color: 'FFFFFF', align: 'center', valign: 'middle', fontSize: 14, bold: true, shadow: { type: 'outer', color: '7C3AED', blur: 10, offset: 0, opacity: 0.4 } };

// Stage 1
slide7.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 2.5, w: 1.8, h: 1, ...nodeProps, text: 'User Input\n(Chat Request)' });
slide7.addShape(pptx.ShapeType.rightArrow, { x: 2.4, y: 2.8, w: 0.5, h: 0.3, fill: 'CBD5E1' });

// Stage 2
slide7.addShape(pptx.ShapeType.roundRect, { x: 3.0, y: 2.5, w: 2.2, h: 1, ...nodeProps, text: 'Context Aggregation\n(Book Metadata + Chat History)' });
slide7.addShape(pptx.ShapeType.rightArrow, { x: 5.3, y: 2.8, w: 0.5, h: 0.3, fill: 'CBD5E1' });

// Stage 3 (AI)
slide7.addShape(pptx.ShapeType.roundRect, { x: 5.9, y: 2.3, w: 2.2, h: 1.4, ...aiNodeProps, text: 'LLM Inference Engine\n(Pollinations AI API)' });

// Stage 4 (Bottom Pipeline)
slide7.addShape(pptx.ShapeType.downArrow, { x: 7.0, y: 3.8, w: 0.3, h: 0.5, fill: 'CBD5E1' });
slide7.addShape(pptx.ShapeType.roundRect, { x: 5.9, y: 4.4, w: 2.2, h: 1, ...nodeProps, text: 'Response Sanitization\n(Deprecation Filter)' });

// Stage 5
slide7.addShape(pptx.ShapeType.leftArrow, { x: 5.3, y: 4.7, w: 0.5, h: 0.3, fill: 'CBD5E1' });
slide7.addShape(pptx.ShapeType.roundRect, { x: 3.0, y: 4.4, w: 2.2, h: 1, ...nodeProps, fill: '10B981', color: 'FFFFFF', text: 'Chat UI Display\n(State Update)' });


// SLIDE 8: Conclusion
let slide8 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide8.addText('Conclusion & Future Scope', { x: 0.5, y: 1, w: 9, h: 0.8, fontSize: 36, bold: true, color: '1E293B' });
slide8.addText([
  { text: 'Reading Progress Tracking: Adding a feature to track which chapter the user is on to prevent the AI from giving plot spoilers.\n\n', options: { fontSize: 18 } },
  { text: 'Backend Database: Migrating the local library storage to a cloud database (Node.js/MongoDB) for cross-device syncing and permanent accounts.\n\n', options: { fontSize: 18 } },
  { text: 'Vocabulary Builder: Automatically generating smart flashcards for archaic or difficult words found in classic novels.', options: { fontSize: 18 } }
], { x: 0.5, y: 2, w: 9, h: 2, color: '333333', bullet: true });
slide8.addText('Thank You! Any Questions?', { x: 1, y: 4.5, w: 8, h: 1, fontSize: 32, bold: true, align: 'center', color: '7C3AED' });

pptx.writeFile({ fileName: 'LitTutor_Presentation_V2.pptx' }).then(fileName => {
    console.log(`Created presentation: ${fileName}`);
});
