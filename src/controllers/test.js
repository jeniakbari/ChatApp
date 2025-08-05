import { User } from "../models/usersModel.js";
// import { FriendRequest } from "../models/friendRequestModel.js";
import { ChatRoom } from "../models/chatRoomModel.js";
// import { ChatParticipant } from "../models/chatParticipantsModel.js";
// import { BlockedUser } from "../models/blockedUserModel.js";
// import { Op } from "sequelize";
// import { getSignedUrl } from '../utility/getSignedUrl.js';
import { getAIResponse } from "../utility/geminiResponse.js";
import { buildPersona } from "../utility/personaBuilder.js";
import { ChatMessage } from "../models/chatMessageModel.js";


const testAi = async (req, res, next) => {
    try {

        let user_id = req.user;
        let { question , room_id } = req.body;
        console.log("User ID:", user_id);
        console.log("Room ID:", room_id);       
        console.log("Question:", question);
        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }
        await ChatMessage.create({
            room_id: room_id,
            sender_id: user_id,
            message: question,
        });

        let findRoom = await ChatRoom.findOne({
        where: {
            room_id: room_id,
            room_type: 1
        },
        include: [
            {
                model: User,
                as: 'Creator',
                attributes: ["user_id","username","ai_persona", "gender"]
            }
            // {
            // model: User,
            // as: 'Participants',
            // attributes: ["user_id","username","ai_persona", "gender"],
            // through: { attributes: [] }, 
            // }
        ],
        raw: true
        });
        console.log("findRoom:", findRoom);
        let aiId = findRoom['Creator.user_id'];
        let aiPersona = findRoom['Creator.ai_persona'];
        let botGender = findRoom['Creator.gender'];
        let aiName = findRoom['Creator.username'];

        console.log("AI ID:", aiId);
        console.log("AI Persona:", aiPersona);
        console.log("botGender:", botGender);
        console.log("AI Name:", aiName)

        if (!findRoom) {
            return res.status(404).json({ message: "Chat room not found chat" });
        }

        let lastMessage = await ChatMessage.findOne({
            where:{
                room_id: room_id,
                sender_id:aiId
            },
            order: [['created_at', 'DESC']],
            raw: true
        })

        if (!lastMessage) {
            return res.status(404).json({ message: "No messages found in this room" });
        }
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const isToday = new Date(lastMessage.created_at) >= startOfToday &&
                        new Date(lastMessage.created_at) < endOfToday;

        
        let isFirstMessage = false;
        if (!isToday) {
            isFirstMessage = true;
        }


        let persona = await buildPersona(botGender, aiPersona, aiName, isFirstMessage);

        let aiResponse = await getAIResponse(question, persona);

        if(!aiResponse){
            return res.status(500).json({ message: "Failed to generate AI response" });
        }
        console.log("AI Response:", aiResponse);

        await ChatMessage.create({
            room_id: room_id,
            sender_id: aiId,
            message: aiResponse,
        });


        return res.
                status(200)
                .json({ message: "AI response generated successfully", 
                        prompt: persona,
                        users_question: question, 
                        AI_Response: aiResponse ,
                        isFirstMessage:isFirstMessage,
                    });

        
    } catch (error) {
        next(error);
    }
}

export { testAi };