var PMP = PMP || {};

(function() {
    var $ = jQuery;

    // Views
    PMP.GroupList = PMP.BaseView.extend({

        modals: {},

        events: {
            'click .pmp-group-modify': 'modifyGroup',
            'click .pmp-group-default': 'setDefault',
            'click .pmp-manage-users': 'manageUsers'
        },

        initialize: function(options) {
            options = options || {};
            this.collection = options.collection || new PMP.WriteableCollection([], { profile: 'group' });
            this.collection.on('reset', this.render.bind(this));

            this.showSpinner();
            if (!options.collection)
                this.collection.search();

            PMP.BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            var self = this,
                template = _.template($('#pmp-groups-items-tmpl').html());

            this.$el.find('#pmp-groups-list').html('');
            this.$el.find('#pmp-groups-list').append(template({ groups: this.collection }));
            this.hideSpinner();
            return this;
        },

        modifyGroup: function(e) {
            var target = e.currentTarget,
                guid = $(target).data('guid'),
                group = this.collection.find(function(g) {
                    return g.get('attributes').guid == guid;
                });

            this.group_modify_modal = new PMP.ModifyGroupModal({ group: group });
            this.group_modify_modal.render();
        },

        setDefault: function(e) {
            var target = e.currentTarget,
                guid = $(target).data('guid'),
                group = this.collection.find(function(g) {
                    return g.get('attributes').guid == guid;
                });

            this.group_default_modal = new PMP.DefaultGroupModal({ group: group });
            this.group_default_modal.render();
        },

        manageUsers: function(e) {
            var target = e.currentTarget,
                guid = $(target).data('guid'),
                group = this.collection.find(function(g) {
                    return g.get('attributes').guid == guid;
                });

            if (typeof this.modals[group.get('attributes').guid] == 'undefined') {
                this.modals[group.get('attributes').guid] = new PMP.ManageUsersModal({
                    collection: group,
                    collectionList: this
                });
            }

            this.modals[group.get('attributes').guid].render();
        }
    });

    PMP.BaseGroupModal = PMP.Modal.extend({
        className: 'pmp-group-modal',

        saveGroup: function() {
            if (typeof this.ongoing !== 'undefined' && $.inArray(this.ongoing.state(), ['resolved', 'rejected']) == -1)
                return false;

            var valid = this.validate();
            if (!valid) {
                alert('Please complete all required fields before submitting.');
                return false;
            }

            var serialized = this.$el.find('form').serializeArray();

            var group = {};
            _.each(serialized, function(val, idx) {
                if (val.value !== '')
                    group[val.name] = val.value;
            });

            var self = this,
                data = {
                    action: this.action,
                    security: PMP.ajax_nonce,
                    group: JSON.stringify({ attributes: group })
                };

            var opts = {
                url: ajaxurl,
                dataType: 'json',
                data: data,
                method: 'post',
                success: function(data) {
                    self.hideSpinner();
                    self.close();
                    PMP.instances.group_list.showSpinner();
                    PMP.instances.group_list.collection.search();
                },
                error: function() {
                    self.hideSpinner();
                    alert('Something went wrong. Please try again.');
                }
            };

            this.showSpinner();
            this.ongoing = $.ajax(opts);
            return this.ongoing;
        },

        validate: function() {
            var inputs = this.$el.find('form input'),
                valid = true;

            _.each(inputs, function(v, i) {
                if (!v.validity.valid)
                    valid = false;
            });

            return valid;
        }
    });

    PMP.CreateGroupModal = PMP.BaseGroupModal.extend({
        content: _.template($('#pmp-create-new-group-form-tmpl').html(), {}),

        action: 'pmp_create_group',

        actions: {
            'Create': 'saveGroup',
            'Cancel': 'close'
        }
    });

    PMP.ModifyGroupModal = PMP.BaseGroupModal.extend({
        action: 'pmp_modify_group',

        actions: {
            'Save': 'saveGroup',
            'Cancel': 'close'
        },

        initialize: function(options) {
            this.group = options.group;
            PMP.Modal.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            var template = _.template($('#pmp-modify-group-form-tmpl').html());
            this.content = template({ group: this.group });
            PMP.Modal.prototype.render.apply(this, arguments);
        }
    });

    PMP.DefaultGroupModal = PMP.BaseGroupModal.extend({
        action: 'pmp_default_group',

        actions: {
            'Yes': 'saveGroup',
            'Cancel': 'close'
        },

        saveGroup: function() {
            PMP.default_group = this.group.get('attributes').guid;
            PMP.BaseGroupModal.prototype.saveGroup.apply(this, arguments);
        },

        initialize: function(options) {
            this.group = options.group;
            PMP.Modal.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            var template = _.template($('#pmp-default-group-form-tmpl').html());
            this.content = template({ group: this.group });
            PMP.Modal.prototype.render.apply(this, arguments);
        }
    });

    PMP.ManageUsersModal = PMP.ManageItemsModal.extend({
        className: 'pmp-group-modal',

        allItems: new Backbone.Collection(PMP.users.items),

        action: 'pmp_save_users',

        unsavedChanges: false,

        profile: 'group',

        itemType: 'users'
    });

    $(document).ready(function() {
        PMP.instances = {};

        PMP.instances.group_list = new PMP.GroupList({
            el: $('#pmp-groups-container'),
            collection: new PMP.WriteableCollection((PMP.groups)? PMP.groups.items:[], { profile: 'group' })
        });

        PMP.instances.group_list.render();

        $('#pmp-create-group').click(function() {
            if (!PMP.instances.group_create_modal)
                PMP.instances.group_create_modal = new PMP.CreateGroupModal();
            PMP.instances.group_create_modal.render();
        });
    });
})();
