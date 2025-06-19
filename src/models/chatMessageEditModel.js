import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class ChatMessageEdit extends Model {
    static associate(models) {
        ChatMessageEdit.belongsTo(models.ChatMessage, {
            foreignKey: 'message_id',
            as: 'OriginalMessage',
        });
    }
}

ChatMessageEdit.init(
    {
        history_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        old_message: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Encrypted previous message content',
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
        tableName: 'chat_message_edit_history',
        timestamps: false,
    }
);

export { ChatMessageEdit };
