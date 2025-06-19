import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class ChatParticipant extends Model {
    static associate(models) {
        ChatParticipant.belongsTo(models.ChatRoom, {
            foreignKey: 'room_id',
            as: 'Room',
        });
        ChatParticipant.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User',
        });
    }
}

ChatParticipant.init(
    {
        participant_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'chat_participants',
        timestamps: false,
    }
);

export { ChatParticipant };
