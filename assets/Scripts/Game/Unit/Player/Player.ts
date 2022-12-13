import { BoxCollider2D, Collider2D, Component, Vec2, Vec3, _decorator } from "cc";
import { IInput } from "../../Input/IInput";
import { UnitHealth } from "../UnitHealth";
import { UnitLevel } from "../UnitLevel";
import { PlayerRegeneration } from "./PlayerRegeneration";
import { PlayerUI } from "./PlayerUI/PlayerUI";
import { Weapon } from "./Weapon/Weapon";

const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
    @property(BoxCollider2D) private collider: BoxCollider2D;
    @property(PlayerUI) private playerUI: PlayerUI;
    @property(Weapon) private weapon: Weapon;

    private input: IInput;
    private health: UnitHealth;
    private level: UnitLevel;
    private regeneration: PlayerRegeneration;
    private speed: number;

    public init(input: IInput, data: PlayerData): void {
        this.input = input;
        this.health = new UnitHealth(data.maxHp);
        this.level = new UnitLevel(data.requiredXP, data.xpMultiplier);
        this.regeneration = new PlayerRegeneration(this.health, data.regenerationDelay);
        this.speed = data.speed;

        this.weapon.init(data.strikeDelay, data.damage);

        this.playerUI.init(this.health);
    }

    public get Health(): UnitHealth {
        return this.health;
    }

    public get Level(): UnitLevel {
        return this.level;
    }

    public get Weapon(): Weapon {
        return this.weapon;
    }

    public get Regeneration(): PlayerRegeneration {
        return this.regeneration;
    }

    public get Collider(): Collider2D {
        return this.collider;
    }

    public gameTick(deltaTime: number): void {
        const movement: Vec2 = this.input.getAxis();
        movement.x *= deltaTime * this.speed;
        movement.y *= deltaTime * this.speed;

        const newPosition: Vec3 = this.node.worldPosition;
        newPosition.x += movement.x;
        newPosition.y += movement.y;

        this.node.setWorldPosition(newPosition);

        this.weapon.gameTick(deltaTime);
        this.regeneration.gameTick(deltaTime);
    }
}

export class PlayerData {
    public requiredXP: number[] = [];
    public speed = 0;
    public maxHp = 0;
    public regenerationDelay = 0;
    public xpMultiplier = 0;
    public goldMultiplier = 0;

    // Weapon
    public strikeDelay = 0;
    public damage = 0;
}
