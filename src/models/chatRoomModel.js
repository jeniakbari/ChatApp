import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class ChatRoom extends Model {
    static associate(models) {
        ChatRoom.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'Creator'
        });
        ChatRoom.hasMany(models.FriendRequest, {
            foreignKey: 'room_id',
            as: 'FriendRequests'
        });
        ChatRoom.hasMany(models.ChatMessage, {
            foreignKey: 'room_id',
            as: 'Messages'
        });
        ChatRoom.hasMany(models.ChatParticipant, { foreignKey: 'room_id', as: 'ChatParticipants' });
        ChatRoom.belongsToMany(models.User, {through: models.ChatParticipant,foreignKey: 'room_id',otherKey: 'user_id',as: 'Participants'});
    }
}

ChatRoom.init(
    {
        room_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        room_type: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue:1,
            comment: '1 = personal, 2 = group',
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        room_name: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Null when room_type = 1',
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
        tableName: 'chat_rooms',
        timestamps: false,
    }
);

export { ChatRoom };
