import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class BlockedUser extends Model {
    static associate(models) {
        BlockedUser.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        });
        BlockedUser.belongsTo(models.User, {
            foreignKey: 'blocked_user_id',
            as: 'BlockedUser'
        });
    }
}

BlockedUser.init(
    {
        block_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        blocked_user_id: {
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
        },
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    },
    {
        sequelize,
        tableName: 'blocked_users',
        timestamps: false,
    }
);

export { BlockedUser };
