import express from 'express';
import connectDB from './config/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import skillsRouter from './routes/skills.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/skills', skillsRouter);


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

console.log(process.env.NODE_ENV);


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});