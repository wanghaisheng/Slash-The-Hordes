import { Camera, Component, JsonAsset, KeyCode, Vec2, _decorator } from "cc";
import { ModalWindowManager } from "../Services/ModalWindowSystem/ModalWindowManager";
import { PlayerCollisionSystem } from "./Collision/PlayerCollisionSystem";
import { PlayerProjectileCollisionSystem } from "./Collision/PlayerProjectileCollisionSystem";
import { WeaponCollisionSystem } from "./Collision/WeaponCollisionSystem";
import { GameSettings } from "./Data/GameSettings";
import { KeyboardInput } from "./Input/KeyboardInput";
import { MultiInput } from "./Input/MultiInput";
import { VirtualJoystic } from "./Input/VirtualJoystic";
import { GameModalLauncher } from "./ModalWIndows/GameModalLauncher";
import { Pauser } from "./Pauser";
import { GameUI } from "./UI/GameUI";
import { EnemyManager } from "./Unit/Enemy/EnemyManager";
import { Player } from "./Unit/Player/Player";
import { HaloProjectileLauncher } from "./Unit/Player/ProjectileLauncher/HaloProjectileLauncher";
import { ProjectileLauncher } from "./Unit/Player/ProjectileLauncher/ProjectileLauncher";
import { HorizontalProjectileLauncher } from "./Unit/Player/ProjectileLauncher/HorizontalProjectileLauncher";
import { Upgrader } from "./Upgrades/Upgrader";

const { ccclass, property } = _decorator;

@ccclass("GameBootstrapper")
export class GameBootstrapper extends Component {
    @property(VirtualJoystic) private virtualJoystic: VirtualJoystic;
    @property(Player) private player: Player;
    @property(ProjectileLauncher) private haloProjectileLauncherComponent: ProjectileLauncher;
    @property(ProjectileLauncher) private verticalProjectileLauncherComponent: ProjectileLauncher;
    @property(EnemyManager) private enemyManager: EnemyManager;
    @property(Camera) private camera: Camera;
    @property(GameUI) private gameUI: GameUI;
    @property(ModalWindowManager) private modalWindowManager: ModalWindowManager;
    @property(JsonAsset) private settingsAsset: JsonAsset;

    private playerCollisionSystem: PlayerCollisionSystem;
    private haloProjectileLauncher: HaloProjectileLauncher;
    private horizontalProjectileLauncher: HorizontalProjectileLauncher;

    private gamePauser: Pauser = new Pauser();

    public start(): void {
        const settings: GameSettings = <GameSettings>this.settingsAsset.json;

        this.virtualJoystic.init();

        const wasd = new KeyboardInput(KeyCode.KEY_W, KeyCode.KEY_S, KeyCode.KEY_A, KeyCode.KEY_D);
        const arrowKeys = new KeyboardInput(KeyCode.ARROW_UP, KeyCode.ARROW_DOWN, KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT);
        const dualInput: MultiInput = new MultiInput([this.virtualJoystic, wasd, arrowKeys]);
        this.player.init(dualInput, settings.player);

        this.playerCollisionSystem = new PlayerCollisionSystem(this.player, settings.player.collisionDelay);
        new WeaponCollisionSystem(this.player.Weapon);

        this.enemyManager.init(this.player.node);

        this.haloProjectileLauncher = new HaloProjectileLauncher(
            this.haloProjectileLauncherComponent,
            this.player.node,
            settings.player.haloLauncher
        );
        this.haloProjectileLauncher.upgrade();

        this.horizontalProjectileLauncher = new HorizontalProjectileLauncher(
            this.verticalProjectileLauncherComponent,
            this.player.node,
            settings.player.xyLaunchers
        );
        this.horizontalProjectileLauncher.upgrade();

        new PlayerProjectileCollisionSystem([this.haloProjectileLauncher, this.horizontalProjectileLauncher]);

        const upgrader = new Upgrader(this.player, this.horizontalProjectileLauncher, this.haloProjectileLauncher, settings.upgrades);
        new GameModalLauncher(this.modalWindowManager, this.player, this.gamePauser, upgrader);

        this.gameUI.init(this.player);
    }

    public update(deltaTime: number): void {
        if (this.gamePauser.IsPaused) return;

        this.player.gameTick(deltaTime);
        this.playerCollisionSystem.gameTick(deltaTime);
        this.enemyManager.gameTick(deltaTime);
        this.haloProjectileLauncher.gameTick(deltaTime);
        this.horizontalProjectileLauncher.gameTick(deltaTime);

        this.camera.node.worldPosition = this.player.node.worldPosition;
    }
}
