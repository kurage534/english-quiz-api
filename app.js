const express = require('express');
const mongoose = require('mongoose');
const rankingsRouter = require('./routes/rankings');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/rankings', rankingsRouter);

// MongoDBに接続（必ずMongoDBをローカルやAtlas等で起動しておいてください）
mongoose.connect('mongodb://localhost:27017/quizapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});