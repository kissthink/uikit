import $ from 'jquery';
import {Animation, isString, Transition} from '../util/index';

export default function (UIkit) {

    UIkit.mixin.toggable = {

        props: {
            cls: Boolean,
            animation: Boolean,
            duration: Number,
            transition: String
        },

        defaults: {
            cls: false,
            animation: false,
            duration: 200,
            transition: 'linear'
        },

        ready() {

            if (isString(this.animation)) {

                this.animation = this.animation.split(',');

                if (this.animation.length == 1) {
                    this.animation[1] = this.animation[0];
                }

                this.animation[0] = this.animation[0].trim();
                this.animation[1] = this.animation[1].trim();

            }

        },

        methods: {

            toggleElement(targets, show, animate) {

                var deferreds = [], toggled, deferred;

                $(targets).each((i, el) => {

                    el = $(el);

                    toggled = this.isToggled(el);

                    var event = $.Event(`before${toggled ? 'hide' : 'show'}`)
                    el.trigger(event, [this]);

                    if (event.result === false) {
                        return;
                    }

                    if (this.animation === true && animate !== false) {

                        var height = el[0].offsetHeight ? el.height() : 0,
                            hideProps = {
                                overflow: 'hidden',
                                height: 0,
                                'padding-top': 0,
                                'padding-bottom': 0,
                                'margin-top': 0,
                                'margin-bottom': 0
                            },
                            inProgress = Transition.inProgress(el);

                        Transition.stop(el);

                        var toggled = this.isToggled(el);

                        if (!toggled) {
                            this._toggle(el, true);
                        }

                        el.css('height', '');
                        var endHeight = el.height();

                        el.height(height);

                        if ((!toggled && show !== false) || show === true) {

                            if (!inProgress) {
                                el.css(hideProps);
                            }

                            deferred = Transition.start(el, {
                                overflow: 'hidden',
                                height: endHeight,
                                'padding-top': '',
                                'padding-bottom': '',
                                'margin-top': '',
                                'margin-bottom': ''
                            }, Math.round(this.duration * (1 - height / endHeight)), this.transition);


                        } else {

                            deferred = Transition
                                .start(el, hideProps, Math.round(this.duration * (height / endHeight)), this.transition)
                                .then(() => this._toggle(el, false));

                        }

                    } else if (this.animation && animate !== false) {

                        Animation.cancel(el);

                        toggled = this.isToggled(el);

                        if ((!toggled && show !== false) || show === true) {

                            this._toggle(el, true);
                            deferred = Animation.in(el, this.animation[0], this.duration);

                        } else {
                            deferred = Animation
                                .out(el, this.animation[1], this.duration)
                                .then(() => this._toggle(el, false));
                        }

                    } else {
                        this._toggle(el, typeof show === 'boolean' ? show : !this.isToggled(el));
                        deferred = $.Deferred().resolve();
                    }

                    deferreds.push(deferred);
                    el.trigger(toggled ? 'hide' : 'show', [this]);
                });

                return $.when.apply(null, deferreds);
            },

            toggleNow(el, show) {
                return this.toggleElement(el, show, false);
            },

            _toggle(el, toggled) {
                el = $(el);

                if (this.cls) {
                    el.toggleClass(this.cls, toggled)
                } else {
                    el.attr('hidden', !toggled);
                }

                this.updateAria(el);
                this.$update(null, el);
            },

            isToggled(el) {
                el = $(el);
                return this.cls ? el.hasClass(this.cls) : !el.attr('hidden');
            },

            updateAria(el) {
                if (this.cls === false) {
                    el.attr('aria-hidden', !this.isToggled(el));
                }
            }

        }

    };

};