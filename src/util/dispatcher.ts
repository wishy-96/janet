import { TextChannel } from 'discord.js';
import { KlasaGuild } from 'klasa';
import { ShoukakuPlayer, ShoukakuTrack } from 'shoukaku';
import JanetClient from '../lib/client';

class EventHandlers {
    static onEvent(param: unknown) {
        if (param instanceof Error || param instanceof Object) console.error(param);
        this.leave();
    }
    static leave() {
        return null;
    }
}

class Dispatcher {
    client: JanetClient;
    guild: KlasaGuild;
    textChanel: TextChannel;
    player: ShoukakuPlayer;
    queue: ShoukakuTrack[];
    playing: boolean;
    onEvent: (param: unknown) => void;
    current: ShoukakuTrack;
    loop: boolean;
    constructor(options) {
        this.client = options.client;
        this.guild = options.guild;
        this.textChanel = options.textChannel;
        this.player = options.player;
        this.queue = [];
        this.playing = null;
        this.loop = false;

        this.onEvent = EventHandlers.onEvent.bind(this);

        this.player.on('end', () => {
            this.play().catch((error) => {
                console.error(error);
                this.leave();
            });
        });
        this.player.on('closed', this.onEvent);
        this.player.on('error', this.onEvent);
        this.player.on('nodeDisconnect', this.onEvent);
        this.player.on('trackException', this.onEvent);
    }

    async leave() {
        this.player.disconnect();
        this.client.queue.delete(this.guild.id);
    }

    async play() {
        if (!this.client.queue.has(this.guild.id) || (!this.queue.length && !this.loop)) return this.leave();
        if (!this.loop) this.current = this.queue.shift();
        await this.player.playTrack(this.current.track);
        this.playing = true;
        if (!this.loop) this.textChanel.send(`Playing: ${this.current.info.title}`);
    }

    async addTrack(track: ShoukakuTrack) {
        this.queue.push(track);
    }
}

export default Dispatcher;
