import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class ChatMessageSeen extends Model {
    static associate(models) {
        ChatMessageSeen.belongsTo(models.ChatMessage, {
            foreignKey: 'message_id',
            as: 'Message',
        });

        ChatMessageSeen.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'SeenBy',
        });
    }
}

ChatMessageSeen.init(
    {
        seen_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        seen_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'chat_message_seen_details',
        timestamps: false,
    }
);

export { ChatMessageSeen };
