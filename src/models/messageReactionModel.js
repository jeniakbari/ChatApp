import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class MessageReaction extends Model {
    static associate(models) {
        MessageReaction.belongsTo(models.ChatMessage, {
            foreignKey: 'message_id',
            // as: 'Message',
        });

        MessageReaction.belongsTo(models.User, {
            foreignKey: 'user_id',
            // as: 'User',
        });
    }
}

MessageReaction.init(
    {
        reaction_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        emoji: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'message_reactions',
        timestamps: false,
    }
);

export { MessageReaction };
