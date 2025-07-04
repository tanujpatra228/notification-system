import express from 'express';
import notificationRoutes from './routes/notificationRoutes.js';
// Start all consumers from a single entry point
import './consumers/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Hello, Express with TypeScript and ES Modules!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
}); 