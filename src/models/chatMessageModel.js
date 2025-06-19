import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class ChatMessage extends Model {
    static associate(models) {
        ChatMessage.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'Sender'
        });
        ChatMessage.belongsTo(models.ChatRoom, {
            foreignKey: 'room_id',
            as: 'Room'
        });
        ChatMessage.hasMany(models.ChatMessageEdit, {
        foreignKey: 'message_id',
        as: 'EditHistories',
});

}
}

ChatMessage.init(
    {
        message_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Encrypted message',  
        },
        is_edited: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    },
    {
        sequelize,
        tableName: 'chat_messages',
        timestamps: false,
    }
);

export { ChatMessage };
